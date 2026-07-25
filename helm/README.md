# CSSA Helm Chart

Helm chart for deploying the Computer Science Student Association (CSSA) web application to Kubernetes.

## Prerequisites

- Kubernetes 1.23+
- Helm 3.8+
- An ingress controller (e.g., nginx-ingress)
- cert-manager (for TLS certificates)

## Quick Start

### 1. Create the namespace and secrets

```bash
kubectl create namespace cssa

# Only needed for GitHub OAuth and NextAuth (database is included)
kubectl create secret generic cssa-secrets \
  --namespace cssa \
  --from-literal=NEXTAUTH_SECRET='your-32-char-secret-here' \
  --from-literal=GITHUB_CLIENT_ID='your-github-oauth-client-id' \
  --from-literal=GITHUB_CLIENT_SECRET='your-github-oauth-client-secret'
```

### 2. Install with Helm (includes PostgreSQL)

```bash
helm install cssa ./helm/cssa \
  --namespace cssa \
  --create-namespace \
  --set ingress.hosts[0].host=cssa.yourschool.edu \
  --set env.NEXTAUTH_URL=https://cssa.yourschool.edu \
  --set postgresql.auth.password=your-secure-password
```

### 3. Or deploy with Argo CD

```bash
kubectl apply -f helm/argocd-application.yaml -n argocd
```

## Configuration

### Key Values

| Parameter                     | Description                      | Default                   |
|-------------------------------|----------------------------------|---------------------------|
| `replicaCount`                | Number of replicas               | `2`                       |
| `image.repository`            | Container image repository       | `ghcr.io/your-org/cssa`   |
| `image.tag`                   | Container image tag              | `Chart.appVersion`        |
| `ingress.enabled`             | Enable ingress                   | `true`                    |
| `ingress.hosts[0].host`       | Ingress hostname                 | `cssa.example.com`        |
| `env.NEXTAUTH_URL`            | NextAuth URL                     | `https://cssa.example.com`|
| `postgresql.enabled`          | Deploy PostgreSQL                | `true`                    |
| `postgresql.auth.password`    | PostgreSQL password              | `changeme-cssa-password`  |
| `postgresql.primary.persistence.size` | Database storage size   | `10Gi`                    |
| `migrations.enabled`          | Run DB migrations on deploy      | `true`                    |
| `autoscaling.enabled`         | Enable HPA                       | `false`                   |
| `externalSecrets.enabled`     | Use external-secrets operator    | `false`                   |

### PostgreSQL Configuration

The chart includes Bitnami PostgreSQL as a dependency. It's enabled by default.

```yaml
postgresql:
  enabled: true
  auth:
    postgresPassword: "admin-password"
    username: cssa
    password: "app-password"
    database: cssa
  primary:
    persistence:
      enabled: true
      size: 10Gi
```

To use an external database instead:

```yaml
postgresql:
  enabled: false

secrets:
  create: true
  databaseUrl: "postgresql://user:pass@external-host:5432/cssa"
```

### Using External Secrets (Optional)

If you want to fetch secrets from Vault or another secrets manager:

```yaml
externalSecrets:
  enabled: true
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
```

## Building the Docker Image

```bash
# Build the image
docker build -t ghcr.io/your-org/cssa:v1.0.0 .

# Push to registry
docker push ghcr.io/your-org/cssa:v1.0.0
```

## Database Migrations

Migrations run automatically on install/upgrade via a Helm hook job when `migrations.enabled: true` (default).

To disable automatic migrations:

```yaml
migrations:
  enabled: false
```

To run migrations manually:

```bash
kubectl run cssa-migrate \
  --namespace cssa \
  --image=ghcr.io/your-org/cssa:v1.0.0 \
  --restart=Never \
  --env="DATABASE_URL=postgresql://..." \
  --command -- npx prisma migrate deploy
```

## Monitoring

The application exposes a health endpoint at `/api/health` which returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "checks": {
    "database": "ok"
  }
}
```

## Troubleshooting

### Pods not starting

Check the logs:
```bash
kubectl logs -l app.kubernetes.io/name=cssa -n cssa
```

### Database connection issues

Verify the secret is correct:
```bash
kubectl get secret cssa-secrets -n cssa -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Ingress not working

Check ingress status:
```bash
kubectl describe ingress cssa -n cssa
```
