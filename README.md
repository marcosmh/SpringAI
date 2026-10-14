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

## Install Ollama

* curl -fsSL https://ollama.com/install.sh | sh

* ollama --version
* ollama list
* ollama pull qwen3:4b
* ollama list

## Download Models qwen
* ollama run qwen3:4b

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

## Ollama Models

* ollama pull nomic-embed-text

* ollama pull qwen3-embedding:0.6b

* ollama pull mxbai-embed-large

## Install Codex CLI

*  brew install --cask codex

* npm install -g @openai/codex

* codex mcp add weatherSpring --url http://localhost:8081/mcp

* codex mcp list

* nano .codex/config.toml 

* codex mcp remove weatherSpring

* codex mcp add weatherSpring -- java -jar /home/imarkdev/DevTraining/SpringAI/springai-mcp-stdio-server/target/springai-mcp-stdio-server-0.0.1-SNAPSHOT.jar


# Claude Configuration

* Configuration:
  "mcpServers": {
	  "spring-ai-weather": {
	  "command": "wsl.exe",
	  "args": [
			"-d", "Debian",
			"/opt/java/jdk-25.0.4.1/bin/java",
			"-Dspring.ai.mcp.server.stdio=true",
			"-Dspring.main.banner-mode=off",
			"-Dlogging.level.root=OFF",
			"-jar",
			"/home/imarkdev/DevTraining/SpringAI/springai-mcp-stdio-server/target/springai-mcp-stdio-server-0.0.1-SNAPSHOT.jar"
		  ]
		}
  },


## Docs

* https://docs.spring.io/spring-ai/reference/index.html

* https://docs.ollama.com/

* https://learn.chatgpt.com/docs/codex/cli