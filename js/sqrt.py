n = 36 
error=0.00001
x1=2
x2=n/x1
diff=x1-x2 
print(f"X1={x1},X2={x2},,Diff={diff}")
if diff<0:
    diff=-diff
while diff>error:
    x1=(x1+x2)/2
    x2=n/x1
    diff=x1-x2 
    if diff<0:
        diff=-diff
    print(f"X1={x1},X2={x2},,Diff={diff}")
print(f"X1={x1},X2={x2},,Diff={diff}")
print(f"Answer{(x1+x2)/2}")