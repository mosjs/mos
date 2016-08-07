#!/bin/bash

for d in packages/*/dist; do
  echo $d; rm -r $d;
done
