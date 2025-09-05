pwd="hello"
encryptcode=1001
print("pwd = ",pwd)
numericalpwd=0
for x in pwd:
    numericalpwd+=ord(x)
print("nmumerical pwd=",numericalpwd)
encryptednumericalkpwd=numericalpwd^encryptcode
print(encryptednumericalkpwd)







