class FileNotFoundError(IOError):
    pass
_FS = {}
class _VFile:
    def __init__(self, name, mode):
        self.name = name
        self.mode = mode
        self.closed = False
        if mode == 'w':
            _FS[name] = ''
        elif mode == 'a':
            if name not in _FS:
                _FS[name] = ''
        self.pos = 0
    def _chk(self, m):
        if self.closed:
            raise ValueError('I/O operation on closed file.')
        if m == 'r' and self.mode != 'r':
            raise IOError('not readable')
        if m == 'w' and self.mode == 'r':
            raise IOError('not writable')
    def read(self):
        self._chk('r')
        d = _FS[self.name][self.pos:]
        self.pos = len(_FS[self.name])
        return d
    def readline(self):
        self._chk('r')
        d = _FS[self.name]
        if self.pos >= len(d):
            return ''
        i = d.find('\n', self.pos)
        if i == -1:
            i = len(d) - 1
        line = d[self.pos:i+1]
        self.pos = i + 1
        return line
    def readlines(self):
        out = []
        line = self.readline()
        while line != '':
            out.append(line)
            line = self.readline()
        return out
    def write(self, s):
        self._chk('w')
        if not isinstance(s, str):
            raise TypeError('write() argument must be str, not ' + type(s).__name__)
        _FS[self.name] = _FS[self.name] + s
        return len(s)
    def close(self):
        self.closed = True
    def __iter__(self):
        return iter(self.readlines())
    def __enter__(self):
        return self
    def __exit__(self, a, b, c):
        self.close()
        return False
def open(name, mode='r'):
    mode = mode.replace('t','')
    if mode not in ('r','w','a'):
        raise ValueError("invalid mode: '" + mode + "'")
    if mode == 'r' and name not in _FS:
        raise FileNotFoundError("[Errno 2] No such file or directory: '" + name + "'")
    return _VFile(name, mode)
