# Backend

El backend se carga en un pod con un contenedor de MYSQL y un contenedor con NodeJs

## Comandos utiles
(Si se está usando Podman es necesario inicializar la maquina [aquí](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md))

### Iniciar podman
Para iniciar el contenedor [Pod](#pod) con [Node](#contenedor-node) y [MYSQL](#mysql) se utiliza el archivo kube [container-compose.yaml](./container-compose.yaml) explicado en [Generar manifiesto kubernete](#generar-manifiesto-kubernete).
```
npm run podI
```
Ejecuta el siguiente codigo en [scripts/podmanInit.sh](./container-backend/scripts/podmanInit.sh)

---
### Actualizar contenedor
Para actualizar contenedor de node:
```
npm run podU
```
Ejecuta el siguiente codigo en [scripts/podmanUpdate.sh](./container-backend/scripts/podmanUpdate.sh)

---
### Pausar contenedor
Para pausar la ejecución del pod:
```
npm run podP
```
---
### Construir imagen
Para reanudar ejecución del pod: 
```
npm run podS
```

---
### Limpiar contenedor
Para parar y limpiar los contenedores dentro del pod:
```
npm run podC
```

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
podman logs -f <name>
```
---
---

## Pod

### Crear un pod 
Para crear un pod de contenedores local llamado ```my_pod``` con salida al puerto ```8080```.

```
podman pod create --name my_pod -p 8080:3000
```

[Ayuda Pod](https://mohitgoyal-co.translate.goog/2021/04/23/spinning-up-and-managing-pods-with-multiple-containers-with-podman/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=sc)


### Generar manifiesto kubernete

Para generar el manifiesto de kubernete, que permite automatizar la creación del pod ```my_pod``` con sus contenedores en un archivo [container-compose.yaml](./container-compose.yaml). 

Teniendo ya [creado](#crear-un-pod) con sus contenedores adentro, el siguiente comando genera el manifiesto kubernete:
```
podman generate kube my_pod > container-compose.yaml
```

### Ejecutar manifiesto kubernete
Para ejecutar el [manifiesto kubernete](#generar-manifiesto-kubernete) se utiliza el siguiente comando:
```
podman play kube <container-compose.yaml>
```


---
## MYSQL

Traer imagen de mysql desde docker.io
```
podman pull docker.io/mysql
```

### Iniciar contenedor MYSQL
Inicia un contenedor de MYSQL en el pod ```my_pod``` llamado ```mysql_test``` con una contraseña y una base de datos llamada ```Pcomida_db```
```
podman run -d --pod my_pod --name db -e MYSQL_ROOT_PASSWORD=<password> -e MYSQL_DATABASE=Pcomida_db mysql:latest
```

### Ejecutar comandos de MYSQL
Para ejecutar comandos de MYSQL en el contenedor [comandos](https://stackoverflow.com/questions/59838692/mysql-root-password-is-set-but-getting-access-denied-for-user-rootlocalhost)
- [Entrar al contenedor](#entrar-a-un-contenedor)
- Loguearse con la contraseña
    ```
    mysql -u root -p
    ```

---
## Contenedor Node

### Contruir imagen de contenedor
Para construir el contenedor con [DockerFile](./container-backend/Dockerfile)
```
podman build -t backend-container .
```

### Montar contenedor de node
Para ejecutar el contenedor, con nombre ```backend_node``` con salida al puerto ```3000```

```
podman run -d --pod my_pod --name backend_node -e NODE_DOCKER_PORT=3000 backend-container
```

---
