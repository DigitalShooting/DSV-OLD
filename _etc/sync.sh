#!/bin/bash
for (( ; ; ))
do
	sudo rsync -avP /media/sf_hsa/ ./test
	echo "sync"
	sleep 1
done

