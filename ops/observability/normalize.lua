-- Only this env file is inspected; transcripts and other owner files are excluded.
local secrets = {}
local file = io.open(os.getenv('NEWS_DIGEST_OBS_ENV_FILE') or '/home/exedev/.config/news-digest/env', 'r')
assert(file, 'Cannot read configured environment key names')
if file then
    for line in file:lines() do
        local key = line:match('^([%w_]+)=')
        if key and (key:match('KEY') or key:match('TOKEN') or key:match('SECRET') or key:match('PASSWORD') or key:match('_URL$')) then
            local value = os.getenv(key)
            if value and #value >= 4 then table.insert(secrets, value) end
        end
    end
    file:close()
end
table.sort(secrets, function(a, b) return #a > #b end)

local function scrub(value)
    if type(value) == 'string' then
        for _, secret in ipairs(secrets) do
            local start = 1
            while true do
                local first, last = value:find(secret, start, true)
                if not first then break end
                value = value:sub(1, first - 1) .. '[REDACTED]' .. value:sub(last + 1)
                start = first + 10
            end
        end
        value = value:gsub('[Bb][Ee][Aa][Rr][Ee][Rr]%s+[^%s,;]+', 'Bearer [REDACTED]')
        value = value:gsub('(https?://)[^%s/@]+:[^%s/@]+@', '%1[REDACTED]@')
    elseif type(value) == 'table' then
        for key, child in pairs(value) do
            local lower = tostring(key):lower()
            if lower:match('password') or lower:match('secret') or lower:match('token') or lower:match('authorization') or lower:match('cookie') or lower:match('api.?key') then
                value[key] = '[REDACTED]'
            else value[key] = scrub(child) end
        end
    end
    return value
end

function normalize(tag, timestamp, record)
    local service = record['_SYSTEMD_USER_UNIT']
    if service then service = service:match('news%-digest%-(.-)%.service') end
    local out = {service = service or tag, source = tag}
    for key, value in pairs(record) do
        if key:sub(1, 1) ~= '_' and key ~= 'MESSAGE' and key ~= 'PRIORITY' and key ~= 'SYSLOG_IDENTIFIER' and key ~= 'SYSLOG_FACILITY' then
            out[key] = value
        end
    end
    local levels = {[10]='trace', [20]='debug', [30]='info', [40]='warn', [50]='error', [60]='fatal'}
    local priorities = {['0']='fatal', ['1']='fatal', ['2']='fatal', ['3']='error', ['4']='warn', ['5']='info', ['6']='info', ['7']='debug'}
    out.level = levels[out.level] or out.level or priorities[record.PRIORITY] or 'info'
    out.log = out.msg or out.log or record.MESSAGE or ''
    return 1, timestamp, scrub(out)
end
