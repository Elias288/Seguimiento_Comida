podman build -t backend-container . \
&& podman run -d --pod my_pod --name backend_node -e NODE_DOCKER_PORT=3000 backend-container