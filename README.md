# SpringAI
Projects Spring AI
--

## Runtime environment:

* OS: Debian GNU/Linux 13 (trixie) x86_64
* Host: MacBookPro9,2 (1.0)
* Kernel: Linux 6.12.95+deb13-amd64
* CPU: Intel(R) Core(TM) i5-3210M (4) @ 3.10 GHz
* Java 25
* Maven 3.9.16
* Spring Boot 4.1.0
* Spring IA

## Docs

* https://docs.spring.io/spring-ai/reference/index.html#

* https://developers.openai.com/


## Tokenizer

* https://platform.openai.com/tokenizer

## Projects

* springai-openai

* springai-ollama

## Docker

### Install Postgres Vector
* docker pull pgvector/pgvector:pg16-trixie

* docker images

* docker ps

* sudo docker run -d --name postgres --restart always \
  -p 5433:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=sasa47 \
  -e POSTGRES_DB=spring_ia_rag \
  pgvector/pgvector:pg16-trixie

* docker logs postgres

* docker exec -it postgres psql -U postgres -d spring_ia_rag

* CREATE EXTENSION IF NOT EXISTS vector;

* CREATE EXTENSION IF NOT EXISTS hstore;

* CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

* select extname from pg_extension;

## Ollama

* ollama pull nomic-embed-text

* ollama pull qwen3-embedding:0.6b

* ollama pull mxbai-embed-large

