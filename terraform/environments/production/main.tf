provider "aws" {
  region = var.region
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.app_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_secretsmanager_secret" "supabase_url" {
  name        = "${var.app_name}-supabase-url"
  description = "Supabase URL for the emergency healthcare app"

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_secretsmanager_secret" "supabase_anon_key" {
  name        = "${var.app_name}-supabase-anon-key"
  description = "Supabase anon key for the emergency healthcare app"

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_secretsmanager_secret" "google_maps_api_key" {
  name        = "${var.app_name}-google-maps-api-key"
  description = "Google Maps API key for the emergency healthcare app"

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "8.7.0"

  name = "${var.app_name}-alb"

  load_balancer_type = "application"

  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.public_subnets
  security_groups = [aws_security_group.alb_sg.id]

  target_groups = [
    {
      name_prefix      = "app-"
      backend_protocol = "HTTP"
      backend_port     = 3000
      target_type      = "ip"
      health_check = {
        enabled             = true
        interval            = 30
        path                = "/"
        port                = "traffic-port"
        healthy_threshold   = 3
        unhealthy_threshold = 3
        timeout             = 5
        protocol            = "HTTP"
        matcher             = "200-399"
      }
    }
  ]

  http_tcp_listeners = [
    {
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_security_group" "alb_sg" {
  name        = "${var.app_name}-alb-sg"
  description = "Security group for the application load balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

module "ecs" {
  source = "../../modules/ecs"

  app_name            = var.app_name
  environment         = var.environment
  region              = var.region
  container_image     = var.container_image
  cluster_name        = "${var.app_name}-cluster"
  vpc_id              = module.vpc.vpc_id
  subnets             = module.vpc.private_subnets
  target_group_arn    = module.alb.target_group_arns[0]
  supabase_url_arn    = aws_secretsmanager_secret.supabase_url.arn
  supabase_anon_key_arn = aws_secretsmanager_secret.supabase_anon_key.arn
  google_maps_api_key_arn = aws_secretsmanager_secret.google_maps_api_key.arn
} 