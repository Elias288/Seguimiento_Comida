podman stop backend-seguimiento_comida \
&& podman rm backend-seguimiento_comida \
&& podman image rm seguimiento_comida_backend_image \
&& podman build -t seguimiento_comida_backend_image . \
&& podman run -d --pod my_pod --name backend-seguimiento_comida -e PORT=3000 seguimiento_comida_backend_image \
&& podman logs -f backend-seguimiento_comida