local gpu = component.proxy(component.list('gpu')())

local c = 1
local components = component.list()

gpu.set(1, c, "== List ==")
c = c + 1

for k, v in pairs(components) do
    gpu.set(1, c, k)
    gpu.set(50, c, v)
    c = c + 1
end

c = c + 1
gpu.set(1, c, "== FS Methods ==")
c = c + 1

local methods = component.methods(component.list('filesystem')())

for k, v in pairs(methods) do
    gpu.set(1, c, k)
    gpu.set(50, c, tostring(v))
    c = c + 1
end

c = c + 1
gpu.set(1, c, "== Invoke ==")
c = c + 1

local fs = component.proxy(component.list('filesystem')())
gpu.set(1, c, tostring(fs.spaceTotal()))