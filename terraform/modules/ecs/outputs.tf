output "cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.emergency_cluster.id
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.emergency_service.name
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.emergency_task.arn
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.ecs_sg.id
}

output "execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.arn
} 