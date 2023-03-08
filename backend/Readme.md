# Backend

El backend se carga en un pod con un contenedor de MYSQL y un contenedor con NodeJs

## Estructura .env

> DB_HOST=localhost
> DB_USER=
> DB_PASSWORD=
> DB_NAME=Pcomida_db
> DB_PORT=3306
> 
> SECRET=
> PORT=8080
> 
> MAIL_HOST=smtp.gmail.com
> MAIL_PORT=465
> MAIL_USERNAME=
> MAIL_PASSWORD=
> MAIL_ADMIN_ADDRESS=
> 
> APIGETWAY_URL=

--- 

## Comandos utiles

(Si se está usando Podman es necesario inicializar la maquina [aquí](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md))

### Iniciar podman

> Para iniciar el contenedor [Pod](#pod) con [Node](#contenedor-node) y [MYSQL](#mysql) se utiliza el archivo kube [container-compose.yaml](./container-compose.yaml) explicado en [Generar manifiesto kubernete](#generar-manifiesto-kubernete).
> 
> ```BASH 
> npm run podI
> ```
>
> Ejecuta el siguiente codigo en [scripts/podmanInit.sh](./container-backend/scripts/podmanInit.sh)

### Actualizar contenedor

> Para actualizar contenedor de node:
>
> ```BASH
> npm run podU
> ```
>
> Ejecuta el siguiente codigo en [scripts/podmanUpdate.sh](./container-backend/scripts/podmanUpdate.sh)

### Pausar contenedor

> Para pausar la ejecución del pod:
> 
> ```BASH
> npm run podP
> ```

### Construir imagen

> Para reanudar ejecución del pod: 
> 
> ```BASH
> npm run podS
> ```


### Limpiar contenedor

> Para parar y limpiar los contenedores dentro del pod:
> ```BASH
> npm run podC
> ```

### Entrar a un contenedor

> Para explorador bash del conenedor elegido
> ```BASH
> podman exec -it <name> bash
> ```

### Logs de contenedor

> Ver de forma interactiva los logs de un contenedor
> ```BASH
> podman logs -f <name>
> ```

---

## Pod

### Crear un pod 

> Para crear un pod de contenedores local llamado `my_pod` con salida al puerto `8080`.
>
> ```BASH
> podman pod create --name my_pod -p 8080:3000
> ```
>
> [Ayuda Pod](https://mohitgoyal-co.translate.goog/2021/04/23/spinning-up-and-managing-pods-with-multiple-containers-with-podman/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=sc)


### Generar manifiesto kubernete

> Para generar el manifiesto de kubernete, que permite automatizar la creación del pod `my_pod` con sus contenedores en un archivo [container-compose.yaml](./container-compose.yaml). 
>
> Teniendo ya [creado](#crear-un-pod) con sus contenedores adentro, el siguiente comando genera el manifiesto kubernete:
>
> ```BASH
> podman generate kube my_pod > container-compose.yaml
> ```

NO ESTÁ FUNCIONANDO
---

### Ejecutar manifiesto kubernete

> Para ejecutar el [manifiesto kubernete](#generar-manifiesto-kubernete) se utiliza el siguiente comando:
>
> ```BASH
> podman play kube <container-compose.yaml>
> ```

---

## MYSQL

> Traer imagen de mysql desde docker.io
>
> ```BASH
> podman pull docker.io/mysql
> ```

### Iniciar contenedor MYSQL

> Inicia un contenedor de MYSQL en el pod ```my_pod``` llamado ```mysql_test``` con una contraseña y una base de datos llamada ```Pcomida_db```
>
> ```BASH
> podman run -d -p 3306:3306 --name db -e MYSQL_ROOT_PASSWORD=<password> -e  MYSQL_DATABASE=Pcomida_db mysql:latest
> ```

### Ejecutar comandos de MYSQL

> Para ejecutar comandos de MYSQL en el contenedor [comandos](https://stackoverflow.com/questions/59838692/mysql-root-password-is-set-but-getting-access-denied-for-user-rootlocalhost)
> - [Entrar al contenedor](#entrar-a-un-contenedor)
> - Loguearse con la contraseña
>
> ```BASH
> mysql -u root -p
> ```

---

## Contenedor Node

### Contruir imagen de contenedor

> Para construir el contenedor con [DockerFile](./container-backend/Dockerfile)
>
> ```BASH
> podman build -t backend-container .
> ```

### Montar contenedor de node

> Para ejecutar el contenedor, con nombre ```backend_node``` con salida al puerto ```3000```
>
> ```BASH
> podman run -d --pod my_pod --name backend_node -e PORT=3000 backend-container
> ```