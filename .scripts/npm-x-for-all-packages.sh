#!/bin/bash

exitstatus=0

for d in packages/*; do
  echo "> ($d)";
  echo "> pnpm $@";
  echo "";
  cd $d;
  pnpm $@ || exitstatus=$?;
  cd ..;
  if [ $exitstatus -ne 0 ]; then
    break;
    exit $exitstatus;
  fi
done

exit $exitstatus
