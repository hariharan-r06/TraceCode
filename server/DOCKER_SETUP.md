# Docker Setup for TraceCode

## 🐳 Building the Sandbox Image

### Step 1: Build the sandbox image
```bash
cd server/docker
docker build -t tracecode-sandbox:latest -f Dockerfile.sandbox .
```

### Step 2: Verify the image
```bash
docker images | grep tracecode-sandbox
```

### Step 3: Test the sandbox
```bash
# Test Python
docker run --rm tracecode-sandbox python -c "print('Hello Python!')"

# Test C++
docker run --rm tracecode-sandbox g++ --version

# Test Java
docker run --rm tracecode-sandbox java --version
```

## 🚀 Running with Docker

### Option 1: Enable Docker in Backend
Set environment variable in `server/.env`:
```
USE_DOCKER=true
```

Then run the backend:
```bash
cd server
npm run dev
```

### Option 2: Use Docker Compose
```bash
cd server
docker-compose up --build
```

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **Network Isolation** | `--network none` |
| **Memory Limit** | `--memory 128m` |
| **CPU Limit** | `--cpus 0.5` |
| **Process Limit** | `--pids-limit 50` |
| **Read-only FS** | `--read-only` |
| **Timeout** | 10 seconds |
| **Non-root User** | `coderunner` user in container |

## 📋 Supported Languages

| Language | Compiler/Interpreter | Version |
|----------|---------------------|---------|
| Python | python3 | 3.10+ |
| C++ | g++ | 11+ |
| C | gcc | 11+ |
| Java | OpenJDK | 17 |

## 🛠️ Troubleshooting

### Docker not running
```bash
# Check if Docker is running
docker info

# Start Docker Desktop (Windows)
# Or on Linux:
sudo systemctl start docker
```

### Permission denied
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
```

### Image not found
```bash
# Rebuild the image
docker build -t tracecode-sandbox:latest -f docker/Dockerfile.sandbox docker/
```
