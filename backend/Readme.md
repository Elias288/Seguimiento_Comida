# Backend

El backend se carga en un pod con un contenedor de MYSQL y un contenedor con NodeJs

## Comandos utiles
(Si se está usando Podman es necesario inicializar la maquina [aquí](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md))

### Iniciar podman
Para iniciar el [Pod](#pod) contenedor y de [MYSQL](#mysql): 
```
npm run podmaninit
```
Ejecuta el siguiente codigo en [scripts/podmanInit.sh](./scripts/podmanInit.sh)

---
### Construir imagen
Para construir la imagen y ejecutar el [contenedor](#comandos-del-contenedor) con todo el backend: 
```
npm run podmanStart
```
Ejecuta el siguiente codigo en [scripts/podmanStart.sh](./scripts/podmanStart.sh)

---
### Actualizar contenedor
Para actualizar contenedor de node:
```
npm run podmanUpdate
```
Ejecuta el siguiente codigo en [scripts/podmanUpdate.sh](./scripts/podmanUpdate.sh)

---
### Limpiar contenedor
Para parar y limpiar los contenedores dentro del pod:
```
npm run podmanClean
```
Ejecuta el siguiente codigo en [scripts/podmanClean.sh](./scripts/podmanClean.sh)

---
### Entrar a un contenedor
Para explorador bash del conenedor elegido
```
podman exec -it <name> bash
```
---
### Logs de contenedor
Ver de forma interactiva los logs de un contenedor
```
podamn logs -f <name>
```
---
---

## Pod

Crear un pod de contenedores local llamado ```my_pod``` con salida al puerto ```3001```.

```
podman pod create --name my_pod -p 3001:3000
```

[Ayuda Pod](https://mohitgoyal-co.translate.goog/2021/04/23/spinning-up-and-managing-pods-with-multiple-containers-with-podman/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=sc)

---
## MYSQL

Traer imagen de mysql desde docker.io
```
podman pull docker.io/mysql
```

Inicia un contenedor de MYSQL en el pod ```my_pod``` llamado ```mysql_test``` con una contraseña y una base de datos llamada ```Pcomida_db```

```
podman run -d --pod my_pod --name mysql_test -e MYSQL_ROOT_PASSWORD=<password> -e MYSQL_DATABASE=Pcomida_db mysql:latest
```

Para iniciar solo el contenedor de Mysql con salida al puerto ```3306```
```
podman run -d --name mysql_test -p 3306:3306 -e MYSQL_ROOT_PASSWORD=<password> -e MYSQL_DATABASE=Pcomida_db mysql:latest
```

Para ejecutar comandos de MYSQL en el contenedor [comandos](https://stackoverflow.com/questions/59838692/mysql-root-password-is-set-but-getting-access-denied-for-user-rootlocalhost)
- [Entrar al contenedor](#entrar-a-un-contenedor)
- Loguearse con la contraseña
    ```
    mysql -u root -p
    ```

---
## Comandos del contenedor

Para construir el contenedor con [DockerFile](./backend/Dockerfile)

```
podman build -t backend-container .
```

Para ejecutar el contenedor de forma interactiva, con nombre ```backend_node``` con salida al puerto ```3000```

```
podman run -it --pod my_pod --name backend_node -e NODE_DOCKER_PORT=3000 backend-container
```

---
