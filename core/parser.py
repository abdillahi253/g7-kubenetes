import argparse
import sys
import yaml
import os

def parse_args():
    parser = argparse.ArgumentParser(description="Build, push, et générer les manifests Kubernetes.")
    parser.add_argument("profile", help="Fichier YAML du profil")
    parser.add_argument("--deploy", action="store_true", help="Déployer directement sur le cluster")
    return parser.parse_args()

def parse_yaml(yaml_file):
    if os.path.isfile(yaml_file):
        with open(yaml_file, 'r', encoding='utf-8') as f:
            try:
                return yaml.safe_load(f)
            except yaml.YAMLError as e:
                print(f"Erreur lors du parsing YAML: {e}")
                return None
    else:
        print(f"Le fichier {yaml_file} n'existe pas.")
        return None
