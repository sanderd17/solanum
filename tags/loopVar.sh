let x=0
while [ "true" ]
do
    let i=0
    while [ $i -lt 3000 ]
    do
        echo "hsl($x,100%,50%)" > myVar.txt
        echo "hsl($x,100%,50%)"
        let x=$x+50
        sleep 1
        let i=$i+1
    done
done
