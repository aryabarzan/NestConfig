#!/bin/bash
set -e
IMAGE_ID=$IMAGE_REPO:$IMAGE_TAG

OTHERARGS=""
#DOCKERARG=" build"

if [[ $IMAGE_TAG =~ "demo" ]]; then
	OTHERARGS=" -f values.demo.yaml"
fi

if [[ $IMAGE_TAG =~ "prod" ]]; then
	OTHERARGS=" -f values.prod.yaml"
fi

echo "Creating docker images for $IMAGE_ID"
echo "CI_REGISTRY is $CI_REGISTRY"

docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
docker build . --tag $IMAGE_ID 
docker push $IMAGE_ID
docker logout $CI_REGISTRY

echo "Image pushed to repository $IMAGE_ID"

cd ./helm


KUBECONFIG=$(echo $KUBECONFIG_FILE)

helm upgrade $HELM_RELEASE . --set image.repository=$IMAGE_REPO --set image.tag=${IMAGE_TAG} --set env.NODE_ENV=$ENV $OTHERARGS  --timeout 300s --install --wait --atomic