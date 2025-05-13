#!/bin/bash

# Configuração para o frontend
ENV_JS="./config.js"
rm -rf ${ENV_JS}
touch ${ENV_JS}

varname='API_BASE_URL'
value=$(printf '%s\n' "${!varname}")
echo "window.$varname = \"$value\";" >> ${ENV_JS}

# Substituir a variável API_BASE_URL na configuração do Nginx
sed -i "s|\${API_BASE_URL}|$value|g" /etc/nginx/conf.d/default.conf