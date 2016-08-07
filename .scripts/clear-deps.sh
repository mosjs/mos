#!/bin/bash

rm -r node_modules;

for d in packages/*/node_modules; do
  echo $d; rm -r $d;
done
