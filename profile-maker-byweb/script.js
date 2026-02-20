const images = {
  alpine: {
    versions: ["3.19", "3.18", "3.17", "3.16"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  debian: {
    versions: ["12", "11", "10"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  ubuntu: {
    versions: ["22.04", "20.04", "18.04"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  fedora: {
    versions: ["39", "38", "37"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  archlinux: {
    versions: ["latest"],
    packages: ["curl", "git", "vim", "python", "nodejs"]
  },
  amazonlinux: {
    versions: ["2023", "2"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  oraclelinux: {
    versions: ["9", "8", "7"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  centos: {
    versions: ["9", "8", "7"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  rockylinux: {
    versions: ["9", "8"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  almalinux: {
    versions: ["9", "8"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  "opensuse/leap": {
    versions: ["15.5", "15.4"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  },
  "opensuse/tumbleweed": {
    versions: ["latest"],
    packages: ["curl", "git", "vim", "python3", "nodejs"]
  }
};

const imageSelect = document.getElementById('image');
const versionSelect = document.getElementById('version');
const packagesList = document.getElementById('packages-list');
const form = document.getElementById('oci-form');
const yamlResult = document.getElementById('yaml-result');
const downloadBtn = document.getElementById('download-btn');

// Affichage dynamique des champs NetworkPolicy
const enableNP = document.getElementById('enable-networkpolicy');
const npOptions = document.getElementById('networkpolicy-options');
const npType = document.getElementById('np-type');
const npRuleFields = document.getElementById('np-rule-fields');
const npFromGroup = document.getElementById('np-from-group');
const npToGroup = document.getElementById('np-to-group');
const npRulesList = document.getElementById('np-rules-list');
const addNpRuleBtn = document.getElementById('add-np-rule');

let npRules = [];

window.onload = function() {
  imageSelect.value = "";
  versionSelect.innerHTML = '<option value="">-- Choisir une version --</option>';
  document.getElementById('version-group').style.display = 'none';
  document.getElementById('packages-group').style.display = 'none';
  packagesList.innerHTML = '';
  document.getElementById('custom-package').value = '';
  yamlResult.style.display = 'none';
  downloadBtn.style.display = 'none';
  npOptions.style.display = 'none';
  npRuleFields.style.display = 'none';
};

imageSelect.addEventListener('change', function() {
  const img = imageSelect.value;
  document.getElementById('version-group').style.display = img ? '' : 'none';
  document.getElementById('packages-group').style.display = 'none';
  versionSelect.innerHTML = '<option value="">-- Choisir une version --</option>';
  packagesList.innerHTML = '';
  if (img && images[img]) {
    images[img].versions.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      versionSelect.appendChild(opt);
    });
  }
});

versionSelect.addEventListener('change', function() {
  const img = imageSelect.value;
  const ver = versionSelect.value;
  document.getElementById('packages-group').style.display = (img && ver) ? '' : 'none';
  packagesList.innerHTML = '';
  if (img && ver && images[img]) {
    images[img].packages.forEach(pkg => {
      const label = document.createElement('label');
      label.className = 'package-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = pkg;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + pkg));
      packagesList.appendChild(label);
    });
  }
});

document.getElementById('add-package-btn').addEventListener('click', function() {
  const input = document.getElementById('custom-package');
  const pkg = input.value.trim();
  if (pkg) {
    const exists = Array.from(packagesList.querySelectorAll('input')).some(cb => cb.value === pkg);
    if (!exists) {
      const label = document.createElement('label');
      label.className = 'package-item';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = pkg;
      checkbox.checked = true;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + pkg));
      packagesList.appendChild(label);
    }
    input.value = '';
  }
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const image = imageSelect.value;
  const version = versionSelect.value;
  const packages = Array.from(packagesList.querySelectorAll('input:checked')).map(cb => cb.value);
  if (!image || !version) return;
  let yaml = `image: ${image}\nversion: ${version}\npackages:`;
  if (packages.length === 0) {
    yaml += "\n  # Aucun package sélectionné";
  } else {
    yaml += "\n" + packages.map(pkg => `  - ${pkg}`).join("\n");
  }
  yamlResult.textContent = yaml;
  yamlResult.style.display = 'block';
  downloadBtn.style.display = 'block';

  // Gestion des options NetworkPolicy
  const npEnabled = enableNP && enableNP.checked;
  let npYaml = "";
  if (npEnabled && npOptions) {
    npYaml = getNetworkPolicyYaml();
  }
  if (npYaml) yaml += "\n" + npYaml;
});

downloadBtn.addEventListener('click', function() {
  const blob = new Blob([yamlResult.textContent], {type: 'text/yaml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'profile.yaml';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
});

// Affiche/masque les options NetworkPolicy selon la case à cocher
enableNP.addEventListener('change', function() {
  npOptions.style.display = this.checked ? 'block' : 'none';
  if (!this.checked) {
    npRuleFields.style.display = 'none';
    npRulesList.innerHTML = '';
    npRules = [];
  }
});

npType.addEventListener('change', function() {
  if (this.value === "Ingress") {
    npRuleFields.style.display = '';
    npFromGroup.style.display = '';
    npToGroup.style.display = 'none';
  } else if (this.value === "Egress") {
    npRuleFields.style.display = '';
    npFromGroup.style.display = 'none';
    npToGroup.style.display = '';
  } else {
    npRuleFields.style.display = 'none';
  }
});

// Ajout d'une règle
addNpRuleBtn.addEventListener('click', function() {
  const type = npType.value;
  const protocol = document.getElementById('np-protocol').value;
  const ports = document.getElementById('np-ports').value;
  let from = document.getElementById('np-from').value;
  let to = document.getElementById('np-to').value;

  if (!type || !protocol || !ports || (type === "Ingress" && !from) || (type === "Egress" && !to)) {
    alert("Veuillez remplir tous les champs de la règle.");
    return;
  }

  const rule = {
    type,
    protocol,
    ports,
    from: type === "Ingress" ? from : undefined,
    to: type === "Egress" ? to : undefined
  };
  npRules.push(rule);

  // Affiche la règle en bas
  const ruleDiv = document.createElement('div');
  ruleDiv.textContent = (type === "Ingress" ? `Depuis: ${from}` : `Vers: ${to}`) +
    ` | Protocole: ${protocol} | Ports: ${ports}`;
  npRulesList.appendChild(ruleDiv);

  // Reset les champs
  if (type === "Ingress") document.getElementById('np-from').value = '';
  if (type === "Egress") document.getElementById('np-to').value = '';
  document.getElementById('np-ports').value = '';
});

// Lors de la génération du YAML, ajoute les règles NetworkPolicy si activé
// Exemple d'intégration dans la génération YAML :
function getNetworkPolicyYaml() {
  if (!enableNP.checked || npRules.length === 0) return '';
  let yaml = 'networkpolicy:\n  rules:\n';
  npRules.forEach(rule => {
    yaml += `    - type: ${rule.type}\n`;
    if (rule.from) yaml += `      from: ${rule.from}\n`;
    if (rule.to) yaml += `      to: ${rule.to}\n`;
    yaml += `      protocol: ${rule.protocol}\n`;
    yaml += `      ports: ${rule.ports}\n`;
  });
  return yaml;
}