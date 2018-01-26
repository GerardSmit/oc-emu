local address = component.list('gpu')()
local proxy = component.proxy(address)

proxy.set(1, 1, 'Works!')