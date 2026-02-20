# Generator-1.0

## Description

Ce projet permet de générer des Dockerfiles, de builder/pusher des images Docker, et de créer des manifests Kubernetes (Namespace, Deployment, Service, NetworkPolicy) à partir d’un fichier YAML profil.  
Il utilise Jinja2 pour les templates, et peut déployer directement sur un cluster Kubernetes.

---

## Prérequis

- Python 3.8+
- Docker installé et accessible
- Accès à un cluster Kubernetes (kubectl configuré)
- Les packages Python suivants :

### Installation des dépendances

```sh
pip install -r requirements.txt
```

**requirements.txt** (exemple) :
```
docker
jinja2
pyyaml
python-dotenv
kubernetes
```

---

## Utilisation

### 1. Préparer un fichier profil YAML

Exemple :
```yaml
profile_id: demo
image: ubuntu
version: "22.04"
packages:
  - curl
  - git
network_policy:
  ingress:
    - from: 10.0.0.0/24
      protocol: TCP
      ports: 80
  egress:
    - to: 0.0.0.0/0
      protocol: UDP
      ports: 53
```

### 2. Lancer le programme

```sh
python3 main.py profile.yaml
```

Pour générer et déployer directement sur le cluster :
```sh
python3 main.py profile.yaml --deploy
```

---

## Variables d’environnement

Crée un fichier `.env` à la racine :
```
DOCKERHUB_USERNAME=ton_username
DOCKERHUB_PASSWORD=ton_token
```

---

## Structure du projet

```
Generator-1.0/
│
├── main.py
├── core/
│   ├── docker_manager.py
│   ├── k8s_manager.py
│   ├── parser.py
├── templates/
│   ├── Dockerfile.j2
│   ├── deployment.yaml.j2
│   ├── service.yaml.j2
│   ├── namespace.yaml.j2
│   ├── networkpolicy.yaml.j2
├── output/
│   └── .gitkeep
├── requirements.txt
├── .env
├── .gitignore
```

---

## Notes

- la page web pour génére le fichier profile dans le dossier `profile-maker-byweb/index.html` (optionnel).
- Les fichiers générés sont placés dans le dossier `output/`.
- Les templates Jinja2 sont dans `templates/`.

---

## Licence

MIT - by G7