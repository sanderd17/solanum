let x=0
while [ "true" ]
do
    let i=0
    while [ $i -lt 3000 ]
    do
        echo "hsl($x,100%,50%)" > myVar$i.txt
        echo "hsl($x,100%,50%)"
        let x=$x+1
        sleep 0.1
        let i=$i+1
    done
done
