variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "emergency-healthcare"
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging, dev)"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "container_image" {
  description = "Docker image to deploy"
  type        = string
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "service_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "CPU units for the task (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "memory" {
  description = "Memory for the task in MiB"
  type        = number
  default     = 2048
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnets" {
  description = "Subnet IDs for the ECS service"
  type        = list(string)
}

variable "target_group_arn" {
  description = "ARN of the load balancer target group"
  type        = string
}

variable "supabase_url_arn" {
  description = "ARN of the Supabase URL secret in AWS Secrets Manager"
  type        = string
}

variable "supabase_anon_key_arn" {
  description = "ARN of the Supabase anon key secret in AWS Secrets Manager"
  type        = string
}

variable "google_maps_api_key_arn" {
  description = "ARN of the Google Maps API key secret in AWS Secrets Manager"
  type        = string
} 