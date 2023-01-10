podman pod create --name my_pod -p 3001:3000 \
&& podman pull docker.io/mysql \
&& podman run -d --pod my_pod --name mysql_test -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=Pcomida_db mysql:latest