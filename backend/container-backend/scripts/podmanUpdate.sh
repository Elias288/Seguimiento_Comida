podman build -t backend-container . \
&& podman stop my_pod-backendnode \
&& podman rm my_pod-backendnode \
&& podman run -d --pod my_pod --name my_pod-backendnode -e PORT=3000 backend-container \
&& podman logs -f my_pod-backendnode