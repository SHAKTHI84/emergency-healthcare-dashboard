terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  # Using local state for demo purposes
  # For production, use remote state as below:
  # backend "s3" {
  #   bucket = "emergency-healthcare-terraform-state"
  #   key    = "terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  # For demo purposes - skip provider config
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
}

# VPC for the application
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "emergency-healthcare-vpc"
  }
}

# Public subnets
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "emergency-healthcare-public-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "emergency-healthcare-igw"
  }
}

# Route table for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "emergency-healthcare-public-rt"
  }
}

# Route table association for public subnets
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security group for the application
resource "aws_security_group" "app" {
  name        = "emergency-healthcare-app-sg"
  description = "Security group for the Emergency Healthcare application"
  vpc_id      = aws_vpc.main.id

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

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "emergency-healthcare-app-sg"
  }
}

# EC2 instance for the application
resource "aws_instance" "app" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.app.id]
  subnet_id                   = aws_subnet.public[0].id
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
    mkdir -p /opt/emergency-healthcare
    cd /opt/emergency-healthcare
    cat > docker-compose.yml << 'EOCF'
    version: '3.8'
    services:
      app:
        image: nginx:alpine
        volumes:
          - ./index.html:/usr/share/nginx/html/index.html
        ports:
          - "80:80"
        restart: always
      prometheus:
        image: prom/prometheus
        volumes:
          - ./prometheus:/etc/prometheus
        ports:
          - "9090:9090"
        restart: always
      grafana:
        image: grafana/grafana
        ports:
          - "3001:3000"
        restart: always
    EOCF
    docker-compose up -d
    EOF

  tags = {
    Name = "emergency-healthcare-app"
  }
}

# Elastic IP for the EC2 instance
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  vpc      = true

  tags = {
    Name = "emergency-healthcare-app-eip"
  }
}

# Output the public IP of the EC2 instance
output "app_public_ip" {
  value = aws_eip.app.public_ip
} 