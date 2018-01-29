local gpu = component.proxy(component.list('gpu')())
local fs = component.proxy(component.list('filesystem')())

local handle = fs.open("test.txt", "rw")
fs.write(handle, "Hello world this is a test")

gpu.set(1, 1, fs.read(handle, 10))
gpu.set(1, 2, fs.read(handle, 10))