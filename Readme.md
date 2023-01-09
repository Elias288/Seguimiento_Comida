# Proyecto comida

## Backend

El backend se carga en un contenedor

### Pod

Crear un pod de contenedores local llamado ```my_pod``` con salida al puerto ```3001```.

```
podman pod create --name my_pod -p 3001:3000
```

[Ayuda Pod](https://mohitgoyal-co.translate.goog/2021/04/23/spinning-up-and-managing-pods-with-multiple-containers-with-podman/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=sc)

---
### MYSQL

Traer imagen de mysql: 
```
podman pull docker.io/mysql
```

iniciar contenedor:

```
podman run -d --pod my_pod --name myql_test -e MYSQL_ROOT_PASSWORD=<password> -e MYSQL_DATABASE=Pcomida_db mysql:latest
```

---
### Comandos del contenedor

(Si se está usando Podman es necesario inicializar la maquina [aquí](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md))

Para construir el contenedor [DockerFile](./backend/Dockerfile)

```
podman build -t backend-container .
```


Para ejecutar el contenedor de forma interactiva

```
podman run -it --pod my_pod --name backend_node -e NODE_DOCKER_PORT=3000 --ignorefile .dockerignore backend-container
```

---
### Comandos utiles

Explorador bash del conenedor elegido
```
podman exec -it <name> bash
```
