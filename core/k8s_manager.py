import os
from jinja2 import Environment, FileSystemLoader

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), '../templates')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../output')

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

def create_namespace(namespace_name, output_path=None):
    template = env.get_template('namespace.yaml.j2')
    content = template.render(namespace=namespace_name)
    output_file = output_path or os.path.join(OUTPUT_DIR, f"{namespace_name}-namespace.yaml")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    return output_file

def create_deployment(namespace_name, image_name, deployment_name, output_path=None):
    template = env.get_template('deployment.yaml.j2')
    content = template.render(
        namespace=namespace_name,
        image=image_name,
        deployment=deployment_name
    )
    output_file = output_path or os.path.join(OUTPUT_DIR, f"{deployment_name}-deployment.yaml")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    return output_file

def create_service(namespace_name, deployment_name, output_path=None):
    template = env.get_template('service.yaml.j2')
    content = template.render(
        namespace=namespace_name,
        deployment=deployment_name
    )
    output_file = output_path or os.path.join(OUTPUT_DIR, f"{deployment_name}-service.yaml")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    return output_file

import yaml
# ... autres imports ...

def create_networkpolicy(namespace_name, deployment_name, network_rules, output_path=None):
    template = env.get_template('networkpolicy.yaml.j2')
    
    # Transformation des règles (dictionnaires) en texte YAML indenté
    ingress_yaml = yaml.dump(network_rules.get('ingress', []), default_flow_style=False) if network_rules.get('ingress') else "[]"
    egress_yaml = yaml.dump(network_rules.get('egress', []), default_flow_style=False) if network_rules.get('egress') else "[]"
    
    content = template.render(
        namespace=namespace_name,
        deployment=deployment_name,
        ingress_rules=ingress_yaml,
        egress_rules=egress_yaml
    )
    output_file = output_path or os.path.join(OUTPUT_DIR, f"{deployment_name}-networkpolicy.yaml")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    return output_file