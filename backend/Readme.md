# Backend

El backend se carga en un pod con un contenedor de MYSQL y un contenedor con NodeJs

## Iniciando proyecto

Los contenedores son una herramienta muy utiles para el ambiente de desarrollo y no cargar al equipo de caracteristicas que solo se utilizarán en un proyecto.<br>
Para este proyecto se utilizan 2 contenedores, uno para la [base de datos](#mysql) que contiene un servidor de mysql y otro para el [backend](#contenedor-node) que es un backend ensamblado en una imagen para ser usado como un contenedor.<br>
Los [PODS](#pod) son contenedores de podman que permiten administrar multiples contenedores.<br><br>
A continuación las intrucciones para iniciar el proyecto de backend:
1. **Descargar imagenes**: Para comenzar debemos descargar la imagen de **Mysql** del repositorio de Docker `docker.io/mysql` con el siguiente comando `podman pull docker.io/mysql`
2. **[Construir la imagen del backend](#ensamblar-imagen-de-contenedor)**: Luego debemos construir la imagen del backend con el siguiente comando `podman build -t backend-container .` que tomará las instrucciones del archivo [dockerfile](./container-backend/src/../Dockerfile) para generar la imagen del backend.
3. **[Crear el Pod](#crear-un-pod)**: Crearemos el Pod que nos permitirá administrar los contenedores necesarios para este proyecto con el siguiente comando `podman pod create --name <podName> -p 8080:3000 -p 3306:3306`, dejando habilitados los puertos `8080` para el backend y el `3306` para la base de datos MYSQL.<br> Reemplazar `<podName>` por un nombre para el pod.
4. **[Instanciar el contenedor de MYSQL](#instanciar-contenedor-dentro-del-pod)**: Ya construido el pod inicializaremos el contenedor de la base de datos MYSQL `podman run -d --pod <podName> --name <containerName> -e MYSQL_ROOT_PASSWORD=<password> -e MYSQL_DATABASE=<databaseName> mysql:latest` (con `-d` dejaremos el contenedor corriendo de fondo).<br> Reemplazar `<podName>` por el nombre del pod que creamos, `<containerName>` por un nombre para el contenedor, `<password>` por una contraseña para el desarrollo y `<databaseName>` por un nombre para la base de datos.
5. **[Instanciar el contenedor con del backed](#instanciar-contenedor-de-node)**: Ya agreada la base de datos agregaremos al pod un contenedor con el backend con el siguiente comando `podman run -d --pod <podName> --name <backendName> -e PORT=3000 backend-container` (con `-d` dejaremos el contenedor corriendo de fondo).<br> Reemplazar `<podName>` por el nombre del pod que creamos y `<backendName>` por un nombre para el contenedor del backend.

Con estos pasos tendremos montado todo el ambiente de desarrollo del backend.<br>
Comandos para facilitar el trabajo con el backend [actualizar](#actualizar-contenedor), [pausar](#pausar-contenedores), [reiniciar](#reinicia-contenedores), [limpiar](#limpiar-contenedor), [entrar](#entrar-a-un-contenedor) y [ver logs](#logs-de-contenedor).

## Estructura .env

Para poder ejecutar el proyecto es necesario agregar el archivo `.env` en nuestro directorio raiz del backend que debe tener los siguientes campos

```BASH
#parametros de la DB
DB_HOST=localhost
DB_USER= #root por defecto
DB_PASSWORD=
DB_NAME=Pcomida_db
DB_PORT=3306

DEV=TRUE

SECRET= #cadena de encriptacion de contraseñas 
PORT=8080 #backend port

#parametros de envio de correos
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ADMIN_ADDRESS=

APIGETWAY_URL= #Frontend URL
```
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

### Pausar contenedores

> Para pausar la ejecución del pod `my_pod`:
> 
> ```BASH
> npm run podP
> ```

### Reinicia contenedores

> Para reanudar ejecución del pod `my_pod`: 
> 
> ```BASH
> npm run podS
> ```

### Limpiar contenedor

> Para parar y eliminar los contenedores dentro del pod:
> ```BASH
> npm run podC
> ```

### Entrar a un contenedor

> Para explorador bash del conenedor de nombre `<containerName>`
> ```BASH
> podman exec -it <containerName> bash
> ```

### Logs de contenedor

> Ver de forma interactiva los logs de un contenedor de nombre `<containerName>`
> ```BASH
> podman logs -f <containerName>
> ```

---

## Pod

Estos comandos ya vienen con parametros por defecto para facilitar la implementación

### Crear un pod 

> Para crear un pod de contenedores local llamado `my_pod` con salida al puerto `8080` y al `3306`.
>
> ```BASH
> podman pod create --name my_pod -p 8080:3000 -p 3306:3306
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
**NO ESTÁ FUNCIONANDO**


### Ejecutar manifiesto kubernete

> Para ejecutar el [manifiesto kubernete](#generar-manifiesto-kubernete) se utiliza el siguiente comando:
>
> ```BASH
> podman play kube <container-compose.yaml>
> ```

---

## MYSQL

Estos comandos ya vienen con parametros por defecto para facilitar la implementación

> Traer imagen de mysql desde docker.io
>
> ```BASH
> podman pull docker.io/mysql
> ```

### Instanciar contenedor individual MYSQL

> Istancia un contenedor de MYSQL en el pod ```my_pod``` llamado ```mysql_test``` con una contraseña y una base de datos llamada ```Pcomida_db```
>
> ```BASH
> podman run -d -p 3306:3306 --name db -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=Pcomida_db mysql:latest
> ```

### Instanciar contenedor dentro del pod

> Instancia un contenedor de MYSQL en el pod `my_pod` llamado `db` con una contraseña y una base de datos llamada `Pcomida_db`
>
> ```BASH
> podman run -d --pod my_pod --name db -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=Pcomida_db mysql:latest
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

Estos comandos ya vienen con parametros por defecto para facilitar la implementación

### Ensamblar imagen de contenedor

> Para ensamblar la imagen del backend con el archivo [DockerFile](./container-backend/Dockerfile)
>
> ```BASH
> podman build -t backend-container .
> ```

### Instanciar contenedor de node

> Para instanciar el contenedor dentro del pod `my_pod`, con nombre ```backend_node``` con salida al puerto ```3000```
>
> ```BASH
> podman run -d --pod my_pod --name backend_node -e PORT=3000 backend-container
> ```
