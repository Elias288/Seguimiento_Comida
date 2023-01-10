podman build -t backend-container . \
&& podman stop backend_node \
&& podman rm backend_node \
&& podman run -d --pod my_pod --name backend_node -e NODE_DOCKER_PORT=3000 backend-container