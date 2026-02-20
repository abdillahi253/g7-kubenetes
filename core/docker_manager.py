import docker
import os
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), '../templates')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../output')

load_dotenv()

def generate_dockerfile(image, version, packages):
    if not (image and version):
        print("Erreur : 'image' ou 'version' manquant dans le YAML.")
        return None

    # Détermine la commande d'installation selon l'image
    if image.lower() == "alpine":
        install_cmd = "apk add --no-cache"
    elif image.lower() in ["debian", "ubuntu"]:
        install_cmd = "apt-get update && apt-get install -y"
    elif image.lower() in ["centos", "fedora"]:
        install_cmd = "yum install -y"
    else:
        install_cmd = "# TODO: Ajouter la commande d'installation pour " + image

    # Prépare Jinja2
    env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
    template = env.get_template('Dockerfile.j2')

    # Rendu du template
    dockerfile_content = template.render(
        image=image,
        version=version,
        packages=packages,
        install_cmd=install_cmd
    )

    dockerfile_path = os.path.join(OUTPUT_DIR, "Dockerfile")
    with open(dockerfile_path, "w", encoding="utf-8") as f:
        f.write(dockerfile_content)

    return dockerfile_path

def build_image(dockerfile_path, image_name, tag):
    try:
        client = docker.from_env()
        image_obj, build_logs = client.images.build(path=OUTPUT_DIR, tag=f'{image_name}:{tag}')
        print(f"Image Docker construite avec succès : {image_name}:{tag}")
        for chunk in build_logs:
            if 'stream' in chunk:
                print(chunk['stream'].strip())
        return True
    except Exception as e:
        print(f"Erreur lors du build de l'image Docker niveau build i: {e}")
        return False

def push_image(image_name, tag):
    try:
        client = docker.from_env()
        dockerhub_user = os.environ.get('DOCKERHUB_USERNAME')
        dockerhub_pass = os.environ.get('DOCKERHUB_PASSWORD')
        repo_tag = f"{dockerhub_user}/{image_name}:{tag}"
        if dockerhub_user and dockerhub_pass:
            print("Astuce : DOCKERHUB_PASSWORD peut être un Personal Access Token Docker Hub.")
            client.images.get(f"{image_name}:{tag}").tag(repo_tag)
            print(f"Push de l'image sur Docker Hub : {repo_tag}")
            client.login(username=dockerhub_user, password=dockerhub_pass)
            for line in client.images.push(repo_tag, stream=True, decode=True):
                if 'status' in line:
                    print(line['status'])
                elif 'error' in line:
                    print(f"Erreur Docker Hub: {line['error']}")
        else:
            print("Variables d'environnement DOCKERHUB_USERNAME et DOCKERHUB_PASSWORD requises pour le push.")

        return repo_tag
    except Exception as e:
        print(f"Erreur lors du push de l'image Docker : {e}")
