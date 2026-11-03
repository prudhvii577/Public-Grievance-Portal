# PyMySQL integration for MySQL database backend
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
