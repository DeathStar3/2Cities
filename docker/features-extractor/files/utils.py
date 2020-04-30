import json


class JSONSerializable:

    def __str__(self):
        return json.dumps(self.__dict__, cls=MyJSONEncoder, indent=2)

    def __repr__(self):
        return str(self)


class MyJSONEncoder(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


"""
    named_object_list
    ~~~~~~~~~~~~~~~~~

    A list of objects indexable with an integer or object's name.

    :copyright: © 2014 by Petr Zemek <s3rvac@gmail.com>
    :license: BSD, see LICENSE for more details
"""


class NamedObjectList(list):
    """A list of objects indexable with an integer or object's name.

    It provides support for a list of objects that have an attribute corresponding to the key passed in parameter
    or property that can be indexed with an integer or object's name.

    For example, consider a ``File`` class with a ``name`` attribute:

    .. code-block:: python

        class File:
            def __init__(self, name):
                self.name = name

            # Other useful methods.

            def __str__(self):
                return self.name

    Then, the present class can be used to do the following:

    >>> files = NamedObjectList([File('a.txt'), File('b.txt'), File('c.txt')])
    >>> print(files[1])
    b.txt
    >>> print(files['b.txt'])
    b.txt

    That is, you can index the list with integers or file names. And, as it
    subclasses the built-in class ``list``, it provides all the methods of the
    standard ``list`` class.
    """

    def __init__(self, key, *args):
        list.__init__(self, *args)
        self.key = key

    def __getitem__(self, key):
        return self._delegate_to_list('__getitem__', key)

    def __setitem__(self, key, value):
        return self._delegate_to_list('__setitem__', key, value)

    def __delitem__(self, key):
        return self._delegate_to_list('__delitem__', key)

    def _delegate_to_list(self, method, key, *args):
        if isinstance(key, str):
            key = self._index_of(key)
        return getattr(super(), method)(key, *args)

    def _index_of(self, name):
        for index, item in enumerate(self):
            if getattr(item, self.key) == name:
                return index
        raise IndexError('no object named {!r}'.format(name))

    def __contains__(self, key) -> bool:
        if isinstance(key, str):
            for item in self:
                if getattr(item, self.key) == key:
                    return True
        return False
