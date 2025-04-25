# Emergency Healthcare Dashboard

A real-time emergency management system providing critical information during health emergencies.

## DevOps Setup Guide

This repository includes a complete DevOps pipeline setup for the Emergency Healthcare Dashboard application. The following tools are implemented:

### 1. Docker

The application is containerized using Docker, which enables consistency across different environments.

To build and run the application with Docker:

```bash
# Build the Docker image
docker build -t emergency-healthcare .

# Run the container
docker run -p 3000:3000 --env-file .env.local emergency-healthcare
```

For local development with Docker Compose:

```bash
# Start the application with monitoring stack
docker-compose up

# Access the application at http://localhost:3000
# Access Grafana at http://localhost:3001
# Access Prometheus at http://localhost:9090
```

### 2. GitHub Actions (CI/CD Pipeline)

A complete CI/CD pipeline is configured in `.github/workflows/ci-cd.yml`. This pipeline:

- Builds and tests the application on every push or pull request to main/master
- Builds and pushes a Docker image when changes are merged to main/master
- Deploys the application to production when changes are merged to main/master

Required secrets in GitHub:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_KEY`
- `DEPLOY_PORT`

### 3. Terraform (Infrastructure as Code)

Terraform configurations for AWS infrastructure are provided in the `terraform` directory:

```bash
# Initialize Terraform
cd terraform/environments/production
terraform init

# Plan the infrastructure changes
terraform plan -var="container_image=username/emergency-healthcare:latest"

# Apply the changes
terraform apply -var="container_image=username/emergency-healthcare:latest"
```

### 4. Ansible (for Automated Deployment)

Ansible playbooks for server setup and application deployment:

```bash
# Run the deployment playbook
cd ansible
ansible-playbook -i inventory/production.yml playbooks/deploy.yml

# To deploy with custom variables
ansible-playbook -i inventory/production.yml playbooks/deploy.yml \
  -e "docker_image=username/emergency-healthcare:latest"
```

### 5. Kubernetes (for Container Orchestration)

Kubernetes manifests for deploying the application with Kustomize:

```bash
# Deploy to production
kubectl apply -k kubernetes/overlays/prod

# View the deployments
kubectl get deployments -n emergency-healthcare-prod

# View the services
kubectl get services -n emergency-healthcare-prod

# View the ingresses
kubectl get ingresses -n emergency-healthcare-prod
```

### 6. Monitoring (Prometheus/Grafana)

The application includes monitoring with Prometheus and Grafana. The dashboards include:

- Request rate
- Response time
- Memory usage
- CPU usage

To access the monitoring tools:
- Prometheus: http://localhost:9090 (when running locally)
- Grafana: http://localhost:3001 (when running locally)

Default Grafana credentials:
- Username: admin
- Password: admin

## Development

To run the application locally for development:

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to see the application.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
