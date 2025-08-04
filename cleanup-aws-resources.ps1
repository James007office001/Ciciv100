# AWS Resources Cleanup Script
Write-Host "Cleaning up AWS resources..."

# Set region
$region = "us-east-1"

# Delete ECS clusters
Write-Host "Deleting ECS clusters..."
$clustersToDelete = @("c2-cluster", "c2-test-cluster")

foreach ($cluster in $clustersToDelete) {
    try {
        Write-Host "Attempting to delete cluster: $cluster"
        aws ecs delete-cluster --cluster $cluster --region $region 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Cluster $cluster deleted successfully"
        } else {
            Write-Host "! Cluster $cluster may not exist or already deleted"
        }
    } catch {
        Write-Host "Error deleting cluster $cluster : $_"
    }
}

# Delete ECR repositories
Write-Host "Deleting ECR repositories..."
$reposToDelete = @("c2-backend")

foreach ($repo in $reposToDelete) {
    try {
        Write-Host "Attempting to delete repository: $repo"
        aws ecr delete-repository --repository-name $repo --region $region --force 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Repository $repo deleted successfully"
        } else {
            Write-Host "! Repository $repo may not exist or already deleted"
        }
    } catch {
        Write-Host "Error deleting repository $repo : $_"
    }
}

# List remaining resources
Write-Host "Checking remaining resources..."

Write-Host "Remaining ECS clusters:"
try {
    aws ecs list-clusters --region $region --output table 2>&1
} catch {
    Write-Host "Error listing ECS clusters: $_"
}

Write-Host "Remaining ECR repositories:"
try {
    aws ecr describe-repositories --region $region --output table 2>&1
} catch {
    Write-Host "Error listing ECR repositories: $_"
}

Write-Host "Cleanup completed!"
