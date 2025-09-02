a=[1,2,3,4,4,4,4,3,-9]
print(a)
n=len(a)
frequencies={}
# print(type(frequencies))
for x in a:
    frequencies[x]=frequencies.get(x,0)+1
print(frequencies)   
mode=0
modefrequency=0
for key,value in frequencies.items():
    if value>modefrequency:
        modefrequency=value 
        mode=key    
print(f"Mode: {mode} with frequency {modefrequency}")

