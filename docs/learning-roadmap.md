# Learning Roadmap

This is the DevOps skill progression for the the project. It's organized by *infrastructure* phase, which runs somewhat independently of the *product* feature slices (see `product-design.md`) - as new features get added, earlier infra phases often get revisited.

## Phase 1 — Local deployment (Docker)

- Build a simple API (Python/FastAPI) + Postgres for user/game data
- Dockerize the API and DB with Docker Compose
- **Learn**: Dockerfiles, multi-stage builds, docker-compose networking

**Status**: done for the core MVP (users, games, match requests, friendships,
events).

## Phase 2 — Break it into services

- Split out a "matching" service that runs on a schedule or reacts to new
  signups
- Add a simple queue between services (start local with Redis, later swap for
  SQS)
- **Learn**: service boundaries, async messaging basics

**Status**: not started. This is the next infra milestone once the
friendships/events product slice settles.

## Phase 3 — Move to AWS (start small)

- Push Docker images to ECR
- Deploy to AWS using ECS (Fargate) first — gentler on-ramp than EKS since
  there's no node/control-plane management
- Use RDS for Postgres, SQS for the queue
- **Learn**: IAM roles, VPCs/subnets, security groups, ECR, ECS/Fargate, RDS,
  SQS — covers most "AWS fundamentals" interview questions

## Phase 4 — Kubernetes

- Once ECS feels comfortable, redeploy the same services to EKS
- Use Helm charts for each service
- Add HPA (Horizontal Pod Autoscaler) on the matching service
- **Learn**: Kubernetes core objects (Deployments, Services, Ingress), Helm,
  autoscaling

## Phase 5 — Infrastructure as Code + CI/CD

- Rewrite all manually-clicked AWS infra in Terraform
- GitHub Actions pipeline: test → build image → push to ECR → deploy (Helm
  upgrade)
- **Learn**: Terraform state, modules, CI/CD pipelines

## Phase 6 — Polish for the resume

- Add Prometheus + Grafana for metrics dashboards
- Add a load test (k6) showing the matching service autoscaling under load —
  good to screen-record for interviews
- Write up the architecture with a diagram

## A note on sequencing with product features

Resist building the full product schema before infra catches up. A reasonable interleaving:

| Infra phase | Product slice riding along |
|---|---|
| Phase 1 | Core MVP: users, games, match requests |
| Phase 1 (extended) | Friendships, events |
| Phase 2 | Matching service consumes match requests via queue; BGG sync as a scheduled job |
| Phase 3 | Same features, now on real AWS infra |
| Phase 4+ | Groups, feed/posts, discovery — by now the infra skeleton is solid, so new features are additive rather than infra-risky |

The goal is to never be learning a brand-new infra concept and a brand-new
product concept in the same sitting if it can be avoided.
