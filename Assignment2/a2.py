def get_length(dna):
    ''' (str) -> int

    Return the length of the DNA sequence dna.

    >>> get_length('ATCGAT')
    6
    >>> get_length('ATCG')
    4
    '''
    return len(dna)


def is_longer(dna1, dna2):
    ''' (str, str) -> bool

    Return True if and only if DNA sequence dna1 is longer than DNA sequence
    dna2.

    >>> is_longer('ATCG', 'AT')
    True
    >>> is_longer('ATCG', 'ATCGGA')
    False
    '''
    return dna1 > dna2



def count_nucleotides(dna, nucleotide):
    ''' (str, str) -> int

    Return the number of occurrences of nucleotide in the DNA sequence dna.

    >>> count_nucleotides('ATCGGC', 'G')
    2
    >>> count_nucleotides('ATCTA', 'G')
    0
    '''
    num_nucleotide = 0
    
    for char in dna:
        if char == nucleotide:
            num_nucleotide += 1
    return num_nucleotide


def contains_sequence(dna1, dna2):
    ''' (str, str) -> bool

    Return True if and only if DNA sequence dna2 occurs in the DNA sequence
    dna1.

    >>> contains_sequence('ATCGGC', 'GG')
    True
    >>> contains_sequence('ATCGGC', 'GT')
    False
    
    '''
    return dna2 in dna1

def is_valid_sequence(dna):
    '''(str) -> bool

    The parameter is a potential DNA sequence.
    Return True if and only if the DNA sequence is valid
    (that is, it contains no characters other than 'A', 'T', 'C' and 'G').

    >>> is_valid_sequence('ATCGGC')
    True
    >>> is_valid_sequence('ATFC')
    False
    '''
    
    nucleotides = "ATCG"
    not_nucleotide = 0
    
    for char in dna:
        if char not in nucleotides:
            not_nucleotide += 1
    if not_nucleotide == 0:
        return True
    else:
        return False

def insert_sequence(dna1, dna2, index):
    '''(str, str, int) -> str

    The first two parameters are DNA sequences and the third parameter is an index. Return the DNA sequence obtained by inserting the second DNA sequence into the first DNA sequence at the given index. (You can assume that the index is valid.) 
    For example, If you call this function with arguments 'CCGG', 'AT', and 2, then it should return 'CCATGG'.

    >>> insert_sequence('ATG', 'ATCGGC', 4)
    ATGATCGGC
    >>> insert_sequence('CCGG', 'AT', 2)
    CCATGG
    '''
    return dna1[:index] + dna2 + dna1[index:]

def get_complement(nucleotide):
    '''(str) -> str

    The first parameter is a nucleotide ('A', 'T', 'C' or 'G'). Return the nucleotide's complement.

    >>> get_complement('A')
    T
    >>> get_complement('T')
    A
    >>> get_complement('C')
    G
    >>> get_complement('G')
    C
    '''
    for char in nucleotide:
        if char == 'A':
            return 'T'
        if char == 'T':
            return 'A'
        if char == 'C':
            return 'G'
        if char == 'G':
            return 'C'
    return complement

def get_complementary_sequence(nucleotides):
    '''(str) -> str

    The parameter is a DNA sequence. Return the DNA sequence that is complementary to the given DNA sequence. 
    For exmaple, if you call this function with 'AT' as the argument, it should return 'TA'.

    >>> get_complementary_sequence('TA')
    AT
    >>> get_complementary_sequence('ACGTACG')
    TGCATGC
    '''
    complement = ''
    for char in nucleotides:
        complement += get_complement(char)
    return complement
