# Build the docker image
docker buildx build --platform linux/amd64 -t sbnpsi/context-browser:latest .

# Push to dockerhub
docker push sbnpsi/context-browser:latest