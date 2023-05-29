# Backend

El backend se carga en un pod con un contenedor de MYSQL y un contenedor con NodeJs

## Iniciando proyecto

Los contenedores son una herramienta muy utiles para el ambiente de desarrollo y no cargar al equipo de caracteristicas que solo se utilizarán en un proyecto.<br>
Para este proyecto se utilizan 2 contenedores, uno para la [base de datos](#mysql) que contiene un servidor de mysql y otro para el [backend](#contenedor-node) que estara ensamblado en un contenedor.

### Variables de entorno

Para poder ejecutar el proyecto es necesario tener el archivo `.env` en nuestro directorio raiz del backend. Para eso se debe duplicar el archivo de ejemplo: [/backend/.env.example](./.env.example), eliminar la extención '.example' y agregar todos los datos necesarios.

### Generar imagen del backend

> Para iniciar este proyecto de forma local necesitaremos generar la imagen del backend y para hacerlo ejecutaremos el siguiente comando. <br>Para saber mas [Ensamblar imagen de contenedor](#ensamble-de-imagen)
> ```sh
> podman build -t proyecto_comida_backend_img .
> ```

### Generar POD - Usando Kubernet

> Para generar nuestro POD usando Kubernet necesitaremos un manifiesto kubernete. Para eso se debe duplicar el archivo de ejemplo: [/backend/pod.yaml.example](./pod.yaml.example), eliminar la extención '.example' y entraremos a modificar el `<DBpassword>` por una contraseña para nuestra base de datos.

> Una vez que ya contamos con nuestro archivo `pod.yaml` podremos ejecutar el siguiente comando para crear nuestro pod junto con el backend y la base de datos especificados en el archivo.
> 
> *Ejecutar este comando desde el path del backend*
> ```sh
> podman play kube pod.yaml
> ```

### Generar POD - Manualmente

Para facilitar usaremos los datos del pod.yaml.

> **POD**
> 
> Lo primero que hay que hacer es crear un pod de contenedores local que llaremos `proyecto_comida` con salida al puerto `8080` y al `3306`.
> 
> ```sh
> podman pod create \
> --name proyecto_comida \
> -p 8080:3000 \
> -p 3306:3306
> ```
>
> [Ayuda Pod](https://mohitgoyal-co.translate.goog/2021/04/23/spinning-up-and-managing-pods-with-multiple-containers-with-podman/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=sc)

> **DATABASE**
> 
> Generaremos nuestra Base de datos MYSQL en el pod `proyecto_comida`.<br>
> *Agregar una contraseña en `<DBpassword>`*
>
> ```sh
> podman run -d \
> --pod proyecto_comida \
> --name proyecto_comida-db \
> -e MYSQL_ROOT_PASSWORD=<DBpassword> \
> -e MYSQL_DATABASE=Pcomida_db \
> -v proyecto_comida_dbVolume:/var/lib/mysql \
> mysql:8.0
> ```

> **BACKEND**
> 
> Por ultimo generaremos el contenedor con el backend en el pod `proyecto_comida`.<br>
> *Ejecutar este comando desde el path del backend*
>
> ```sh
> podman run -d \
> --pod proyecto_comida \
> -v "$(pwd)":/usr/src/app \
> -e PORT=3000 \
> -e DEV=true \
> --name proyecto_comida-backend \
> proyecto_comida_backend_img
> ```

--- 

## Comandos utiles

(Si se está usando Podman es necesario inicializar la maquina [aquí](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md))

### Iniciar podman

> Para iniciar el contenedor [Pod](#pod) con [Node](#contenedor-node) y [MYSQL](#mysql) se utiliza el archivo kube [container-compose.yaml](./container-compose.yaml) explicado en [Generar manifiesto kubernete](#generar-manifiesto-kubernete).
> 
> ```sh 
> npm run podI
> ```
>
> Ejecuta el siguiente codigo en [scripts/podmanInit.sh](./container-backend/scripts/podmanInit.sh)

### Actualizar contenedor

> Para actualizar contenedor de node:
>
> ```sh
> npm run podU
> ```
>
> Ejecuta el siguiente codigo en [scripts/podmanUpdate.sh](./container-backend/scripts/podmanUpdate.sh)

### Pausar contenedores

> Para pausar la ejecución del pod `my_pod`:
> 
> ```sh
> npm run podP
> ```

### Reinicia contenedores

> Para reanudar ejecución del pod `my_pod`: 
> 
> ```sh
> npm run podS
> ```

### Limpiar contenedor

> Para parar y eliminar los contenedores dentro del pod:
> ```sh
> npm run podC
> ```

### Entrar a un contenedor

> Para explorador bash del conenedor de nombre `<containerName>`
> ```sh
> podman exec -it <containerName> bash
> ```

### Logs de contenedor

> Ver de forma interactiva los logs de un contenedor de nombre `<containerName>`
> ```sh
> podman logs -f <containerName>
> ```

---

# Generar manifiesto kubernete

> Para generar el manifiesto de kubernete, que permite automatizar la creación del pod `my_pod` con sus contenedores en un archivo [container-compose.yaml](./container-compose.yaml). 
>
> Teniendo ya [creado](#crear-un-pod) con sus contenedores adentro, el siguiente comando genera el manifiesto kubernete:
>
> ```sh
> podman generate kube my_pod > container-compose.yaml
> ```


### Ejecutar manifiesto kubernete

> Para ejecutar el [manifiesto kubernete](#generar-manifiesto-kubernete) se utiliza el siguiente comando:
>
> ```sh
> podman play kube <container-compose.yaml>
> ```

---

## MYSQL

### Ejecutar comandos de MYSQL

> Para ejecutar comandos de MYSQL en el contenedor [comandos](https://stackoverflow.com/questions/59838692/mysql-root-password-is-set-but-getting-access-denied-for-user-rootlocalhost)
> - [Entrar al contenedor](#entrar-a-un-contenedor)
> - Loguearse con la contraseña
>
> ```sh
> mysql -u root -p
> ```

---

## Contenedor Node

Estos comandos ya vienen con parametros por defecto para facilitar la implementación

### Ensamble de imagen

> En los contenedores nos permiten usando el comando `podman build` crear imagenes personalizadas con nuestros propios archivos. Para eso contamos con el archivo [Containerfile](./Containerfile) que le indica que debe hacer
>
> En este caso nuestro archivo `Containerfile` contendra las siguientes ordenes:
> 
> ```sh
> FROM node:18                  # Le indicamos que imagen debe tomar
> RUN mkdir -p /usr/src/app     # Creara si no existen el directorio /usr/src/app
> WORKDIR /usr/src/app          # Definira el siguiente directorio en el que trabajaremos
> COPY package*.json ./         # Copiara todos los archivos package*.json
> RUN npm install               # Ejecutara el comando para instalar las dependencias de node
> COPY . .                      # Copiara todos los archivos del backend
> EXPOSE 3000                   # Definira el puerto del contenedor
> CMD npm install && npm start  # El comando principal del contenedor
> ```
>
> Para crear nuestra imagen ejecutaremos el siguiente comando:
> 
> ```sh
> podman build -t <img_name> .
> ```
> Documentacion - [podman build](https://docs.podman.io/en/latest/markdown/podman-build.1.html)

### Instanciar contenedor de node

> Para instanciar el contenedor
>
> ```sh
> podman run --name <container_name> <img_name>
> ```
> Documentacion - [podman run](https://docs.podman.io/en/latest/markdown/podman-run.1.html)
