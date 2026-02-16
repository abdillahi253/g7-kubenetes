import sys
import subprocess
import os
import yaml
from core.docker_manager import generate_dockerfile, build_image, push_image
from core.k8s_manager import create_namespace, create_deployment, create_service, create_networkpolicy
from core.parser import parse_yaml, parse_args

def main():
    args = parse_args()
    profile_content = parse_yaml(args.profile)

    if profile_content is None:
        print("Erreur lors du chargement du fichier YAML.")
        sys.exit(1)

    profile_id = profile_content.get('profile_id')
    image = profile_content.get('image')
    version = profile_content.get('version')
    packages = profile_content.get('packages', [])
    namespace = f"{profile_id}-ns"
    deployment_name = f"{profile_id}-customby-g7"
    image_tag = version
    image_full = f"{deployment_name}:{image_tag}"
    network_policy = profile_content.get('network_policy', {})

    # Générer le Dockerfile via Jinja2 et récupérer le chemin
    dockerfile_path = generate_dockerfile(image, version, packages)

    # Build & push l'image
    if build_image(dockerfile_path, deployment_name, image_tag):
        push_image(deployment_name, image_tag)
        print("Image build & push réussis")
    else:
        print("Erreur lors du build de l'image niveau main.")
        if os.path.exists(dockerfile_path):
            os.remove(dockerfile_path)
        sys.exit(1)

    # Nettoyer le Dockerfile après le build
    if os.path.exists(dockerfile_path):
        os.remove(dockerfile_path)

    # Générer les manifests Kubernetes
    ns_yaml = create_namespace(namespace)
    dep_yaml = create_deployment(namespace, image_full, deployment_name)
    svc_yaml = create_service(namespace, deployment_name)
    np_yaml = create_networkpolicy(namespace, deployment_name, network_policy)
    print(f"Manifests générés :\n- {ns_yaml}\n- {dep_yaml}\n- {svc_yaml}\n- {np_yaml}")

    if args.deploy:
        print("Déploiement sur le cluster Kubernetes en cours...")
        try:
            # Application individuelle pour garantir l'ordre (d'abord le namespace)
            for manifest in [ns_yaml, dep_yaml, svc_yaml, np_yaml]:
                subprocess.run(["kubectl", "apply", "-f", manifest], check=True)
            print("Déploiement terminé avec succès.")
        except subprocess.CalledProcessError as e:
            print(f"Erreur lors du déploiement avec kubectl: {e}")

if __name__ == "__main__":
    main()