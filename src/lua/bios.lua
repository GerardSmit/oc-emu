local gpu = component.proxy(component.list('gpu')())

gpu.setPrecise(true)
gpu.setBackgroundAlpha(0)

local x, y, r = 100, 100, 100
for i = 1, 50 do
    local angle = i * math.pi / 25
    local ptx, pty = x + r * math.cos( angle ), y + r * math.sin( angle )
    gpu.set(ptx, pty, "*")
end

local txt = "OC Emu"
gpu.set(100 - txt:len() * 8 / 2, 100, txt)