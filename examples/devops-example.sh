#!/bin/bash

# DevOps Agent Example Usage
# This script demonstrates various DevOps tasks

echo "=== DevOps Agent Examples ==="
echo ""

# Example 1: Build and deploy Docker container
echo "Example 1: Docker container deployment"
node ../cli.js devops "Build Docker image from current directory and push to registry"
echo ""

# Example 2: Kubernetes deployment
echo "Example 2: Kubernetes deployment"
node ../cli.js devops "Deploy application to Kubernetes cluster with 3 replicas"
echo ""

# Example 3: Terraform infrastructure
echo "Example 3: Terraform infrastructure provisioning"
node ../cli.js devops "Initialize and apply Terraform configuration in ./infrastructure directory"
echo ""

# Example 4: CI/CD pipeline
echo "Example 4: CI/CD pipeline execution"
node ../cli.js devops "Run full CI/CD pipeline: test, build, and deploy to staging"
echo ""

# Example 5: Infrastructure monitoring
echo "Example 5: Infrastructure health check"
node ../cli.js devops "Check health of all running containers and services"
echo ""
