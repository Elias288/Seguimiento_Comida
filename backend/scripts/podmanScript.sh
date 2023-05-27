img=$(podman images | grep proyecto_comida_backend_img | wc -l)
pod=$(podman pod list | grep proyecto_comida | wc -l)
backendContainer=$(podman ps | grep proyecto_comida-back | wc -l)

if [[ $1 == 'help' ]] then
    echo "podH      /help" 
    echo "podI      /init" 
    echo "podU      /update"
    echo "podC      /clean"
    echo "podP      /pause" 
    echo "podS      /start"

elif [[ $1 == "init" ]] then
    if [[ $img -eq 0 ]] then
        echo "initialize image and pod"
        podman build -t proyecto_comida_backend_img . 
        podman play kube pod.yaml
    elif [[ $pod -eq 0 ]] then
        echo "initialize pod"
        podman play kube pod.yaml
    else
        echo "backend is up"
    fi
    
    podman ps --pod | grep proyecto_comida
    podman logs -f proyecto_comida-back

elif [[ $1 == 'update' ]] then
    podman restart proyecto_comida-back
    podman logs -f proyecto_comida-back

elif [[ $1 == 'clear' ]] then
    podman pod stop proyecto_comida
    podman pod rm proyecto_comida
    podman image rm proyecto_comida_backend_img

elif [[ $1 == 'start' ]] then
    if [[ $pod -eq 0 ]] then
        echo "pod not inizialized"
    else
        podman pod start proyecto_comida
    fi

elif [[ $1 == 'stop' ]] then
    if [[ $pod -eq 0 ]] then
        echo "pod not inizialized"
    else
        podman pod stop proyecto_comida
    fi

else
    echo "fin"
fi