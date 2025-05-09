#!/bin/bash

if [ -f .env.prod ]; then
  export $(cat .env.prod | xargs)
fi

if [ -z "$FIREBASE_TOKEN" ] || [ -z "$FIREBASE_SERVICE_ACCOUNT_PROJECT_ID" ]; then
  echo "FIREBASE_TOKEN e FIREBASE_SERVICE_ACCOUNT_PROJECT_ID precisam estar definidos no .env.prod"
  exit 1
fi

firebase deploy --only firestore:rules,firestore:indexes \
  --token "$FIREBASE_TOKEN" \
  --project "$FIREBASE_SERVICE_ACCOUNT_PROJECT_ID"
