product = 1 

for i in range(1, 101):
    if i % 2 == 0:  
        continue

    print(f"{product} * {i} = {product * i}")
    product *= i 
    if product >= 100: 
        break
