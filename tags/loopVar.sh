let x=0
while [ "true" ]
do
    echo "hsl($x,100%,50%)" > myVar.txt
    echo "hsl($x,100%,50%)"
    let x=$x+50
    sleep 1
done
