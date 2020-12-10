# Build the docker image
docker build -t sbnpsi/context-browser:latest .

# Push to dockerhub
docker push sbnpsi/context-browser:latest