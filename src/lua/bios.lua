local address = component.list('gpu')()
local gpu = component.proxy(address)

computer.beep(1000, 100)
gpu.set(1, 1, 'Hello world!')